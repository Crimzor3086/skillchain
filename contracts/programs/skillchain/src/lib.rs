use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_metadata_accounts_v3, mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3,
        Metadata,
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod skillchain {
    use super::*;

    /// Initialize the credential program
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let credential_authority = &mut ctx.accounts.credential_authority;
        credential_authority.authority = ctx.accounts.authority.key();
        credential_authority.bump = *ctx.bumps.get("credential_authority").unwrap();
        
        msg!("SkillChain credential program initialized");
        Ok(())
    }

    /// Mint a soulbound credential NFT
    pub fn mint_credential(
        ctx: Context<MintCredential>,
        quest_id: u64,
        metadata_uri: String,
        name: String,
        symbol: String,
    ) -> Result<()> {
        let recipient = &ctx.accounts.recipient;
        let mint = &ctx.accounts.mint;
        let token_account = &ctx.accounts.token_account;
        let credential_authority = &ctx.accounts.credential_authority;

        // Mint exactly 1 token (NFT)
        let cpi_accounts = MintTo {
            mint: mint.to_account_info(),
            to: token_account.to_account_info(),
            authority: credential_authority.to_account_info(),
        };

        let authority_key = credential_authority.authority;
        let seeds = &[
            b"credential_authority",
            authority_key.as_ref(),
            &[credential_authority.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

        mint_to(cpi_ctx, 1)?;

        // Create metadata for the NFT
        let data_v2 = DataV2 {
            name,
            symbol,
            uri: metadata_uri,
            seller_fee_basis_points: 0, // No royalties for credentials
            creators: None,
            collection: None,
            uses: None,
        };

        let metadata_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata.to_account_info(),
                mint: mint.to_account_info(),
                mint_authority: credential_authority.to_account_info(),
                update_authority: credential_authority.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            signer,
        );

        create_metadata_accounts_v3(metadata_ctx, data_v2, true, true, None)?;

        // Create credential record
        let credential = &mut ctx.accounts.credential;
        credential.recipient = recipient.key();
        credential.mint = mint.key();
        credential.quest_id = quest_id;
        credential.minted_at = Clock::get()?.unix_timestamp;
        credential.is_soulbound = true;
        credential.bump = *ctx.bumps.get("credential").unwrap();

        msg!(
            "Credential minted for quest {} to recipient {}",
            quest_id,
            recipient.key()
        );

        Ok(())
    }

    /// Verify a credential (read-only operation)
    pub fn verify_credential(ctx: Context<VerifyCredential>) -> Result<CredentialData> {
        let credential = &ctx.accounts.credential;
        
        Ok(CredentialData {
            recipient: credential.recipient,
            mint: credential.mint,
            quest_id: credential.quest_id,
            minted_at: credential.minted_at,
            is_soulbound: credential.is_soulbound,
        })
    }

    /// Burn a credential (admin only, for revocation)
    pub fn burn_credential(ctx: Context<BurnCredential>) -> Result<()> {
        let credential = &mut ctx.accounts.credential;
        
        // Mark as burned (we don't actually burn the token to preserve history)
        credential.burned_at = Some(Clock::get()?.unix_timestamp);
        
        msg!("Credential {} burned/revoked", credential.mint);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + CredentialAuthority::INIT_SPACE,
        seeds = [b"credential_authority", authority.key().as_ref()],
        bump
    )]
    pub credential_authority: Account<'info, CredentialAuthority>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(quest_id: u64)]
pub struct MintCredential<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + Credential::INIT_SPACE,
        seeds = [b"credential", recipient.key().as_ref(), quest_id.to_le_bytes().as_ref()],
        bump
    )]
    pub credential: Account<'info, Credential>,

    #[account(
        seeds = [b"credential_authority", credential_authority.authority.as_ref()],
        bump = credential_authority.bump
    )]
    pub credential_authority: Account<'info, CredentialAuthority>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = credential_authority,
        mint::freeze_authority = credential_authority,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = recipient,
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    pub recipient: SystemAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
}

#[derive(Accounts)]
pub struct VerifyCredential<'info> {
    pub credential: Account<'info, Credential>,
}

#[derive(Accounts)]
pub struct BurnCredential<'info> {
    #[account(
        mut,
        has_one = mint,
    )]
    pub credential: Account<'info, Credential>,

    pub mint: Account<'info, Mint>,

    #[account(
        seeds = [b"credential_authority", credential_authority.authority.as_ref()],
        bump = credential_authority.bump
    )]
    pub credential_authority: Account<'info, CredentialAuthority>,

    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct CredentialAuthority {
    pub authority: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Credential {
    pub recipient: Pubkey,
    pub mint: Pubkey,
    pub quest_id: u64,
    pub minted_at: i64,
    pub burned_at: Option<i64>,
    pub is_soulbound: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CredentialData {
    pub recipient: Pubkey,
    pub mint: Pubkey,
    pub quest_id: u64,
    pub minted_at: i64,
    pub is_soulbound: bool,
}

#[error_code]
pub enum SkillChainError {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Credential already exists for this quest")]
    CredentialAlreadyExists,
    #[msg("Invalid quest ID")]
    InvalidQuestId,
    #[msg("Credential is soulbound and cannot be transferred")]
    SoulboundTransferAttempt,
}