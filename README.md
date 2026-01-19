# Vercel Deploy

Minimal deployment bundle for the SSV staking dashboard.

## Deploy
1. Install dependencies: `npm install`
2. Run locally: `npm run dev`
3. Build for production: `npm run build`
4. Deploy to Vercel: import this folder (`vercel-deploy`) as a Next.js project.

## Environment
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (optional, defaults to `demo-project-id`)

## Enable Hidden Features:
In localstorage add ssv-feature-flags = true

# SSV Staking Interface

```
SSV Staking Dashboard
├─ Top Bar
│  └─ Connect / Account
├─ Network Summary
│  ├─ Current APR
│  └─ Total SSV Staked
├─ Portfolio Summary
│  ├─ Available to Stake (SSV)
│  ├─ Staked Balance (cSSV)
│  └─ Claimable ETH
├─ Actions (Tabs)
│  ├─ Stake
│  ├─ Unstake
│  └─ Claim
└─ FAQ
```

# Overview
Single-page staking dashboard on the Hoodi network. Users stake SSV to mint cSSV 1:1, request unstake with a cooldown, then withdraw, and claim ETH rewards. Network stats are visible without connecting; balances and actions unlock after connecting a wallet.

| User Personas and Stories SSV Token Holder / Incentivized Receiver As an SSV Holder, I want a single screen that shows available balance, staked balance, APR, and claimable rewards As an SSV Holder, I want simple flows for stake, unstake (with cooldown visibility), and claim As an SSV Holder, I want to see network-wide totals before connecting my wallet Crypto Native / Protocol Researcher As a researcher, I want to view the staking interface and network stats read-only without connecting a wallet |
| :---- |

# Navigation
Top bar with branding and wallet state. When disconnected, clicking the primary button opens the wallet connect modal.

# Network Summary
Always visible (no wallet required).
* Current APR: computed from the change in `accEthPerShare` over time and adjusted by ETH/SSV price ratio (see below).
* Total SSV Staked: global total supply of staked SSV (cSSV supply).
* Includes a staking calculator icon with tooltip “Staking Calculator” that links to `https://ethaccrualtoken.com/`.

APR Calculation
```
APR = ((ΔIndex / (1e18 × ΔTime)) × 31,536,000) × (Price_ETH / Price_SSV) × 100
```
* `ΔIndex` = change in `accEthPerShare` between the two latest samples.
* `ΔTime` = seconds between samples (unix timestamps).
* Prices are from CoinGecko (ETH + SSV).
* Sampling is stored once per 24h via a cron job; UI reads the latest two samples.
* If delta ≤ 0, ΔTime ≤ 0, or no data available, APR shows `--`.
* APR endpoint is optional locally; when disabled or missing env, return `--`.

# APR Data Sources
**Contract Reads**
```
accEthPerShare()
totalStaked()
```
**Off-chain Sources**
```
CoinGecko simple price API (ethereum, ssv-network)
```

# Portfolio Summary
Visible once connected.
* Available to Stake: wallet SSV balance.
* Staked Balance: wallet cSSV balance.
* Claimable: ETH rewards available to claim.
* Numbers show “--” if data is unavailable; otherwise formatted with thousands separators.

# Actions: Stake Flow
* Input amount or click MAX to fill wallet SSV balance.
* Primary CTA “Stake”
* Validation:
  * CTA "Connect Wallet" when disconnected.
  * Disabled when amount is empty/zero.
  * Errors shown for insufficient SSV balance.
* On stake submit:
  * Open stake modal and auto-start approval if allowance is insufficient.
  * Approval step shows spinner + “Waiting…”, then tx hash, then checkmark on confirm.
  * After approval confirms, stake auto-starts.
  * If approval isn’t required, stake step starts immediately.
  * On error, step shows red icon with “Try Again”.
  * On success: show success toast, clear tx state, and refresh balances/allowances.
* After stake completes:
  * Show “Add cSSV to Metamask” button in the modal (wallet_watchAsset).
  * Show a full-width “Close” button and a top-right “X”. These appear only after completion.
  * Clicking outside the modal does not close it - IMPORTANT, REMEMBER COMPOSE??
* Expected result: cSSV minted 1:1 to the staked SSV amount; wallet SSV decreases by staked amount.

**Contract Calls**
```
approve(address spender, uint256 amount)  // SSV token -> staking contract
stake(uint256 amount)                      // Staking contract
```

**Contract Reads**
```
decimals()                  // SSV token
decimals()                  // cSSV token
allowance(address owner, address spender)
```

# Actions: Unstake Flow
Two-step process: request, then withdraw after cooldown.

Request Unstake
* Input amount (cSSV).
* If no amount, CTA disabled. If disconnected, CTA = "Connect Wallet"
* On submit:
  * Open unstake modal; if cSSV allowance is insufficient, auto-approve then request.
  * Burns cSSV immediately and records pending withdrawal with unlockTime = now + cooldownDuration.
  * Refresh staked balance, pending data, claimable ETH, allowance, wallet balance.
* UI state after request:
  * Pending card shows requested amount and status pill (“Requested” or “Withdrawable”).
  * Countdown updates live until unlock; withdraw action is disabled until unlocked.

Withdraw Unlocked
* When unlockTime has passed, the action button becomes “Withdraw”.
* On click:
  * Transfers SSV back to the wallet for the pending amount.
  * Clears pending state.
  * Open withdraw modal (single step) with waiting → tx hash → confirmed.
  * Refresh balances and claimable stats.

Cooldown Rules
* Cooldown duration shown in days on stake tab and countdown on unstake tab.
* If current time < unlockTime: button disabled with countdown text.
* If unlockTime passed: button enabled “Withdraw”.

**Contract Calls**
```
requestUnstake(uint256 amount)   // Staking contract
withdrawUnlocked()               // Staking contract
```

**Contract Reads**
```
pendingUnstake(address user)   // amount, unlockTime
cooldownDuration()
stakedBalanceOf(address user)
```

# Actions: Claim Rewards
* Shows total claimable ETH in a summary card.
* CTA is enabled when connected; CTA "Connect Wallet" when disconnected.
* On click:
  * Open claim modal (single step) with waiting → tx hash → confirmed.
  * On success: show success toast and refresh claimable ETH, staked balance, pending data, and balances.
  * On failure: show error toast and “Try Again”.

**Contract Call**
```
claimEthRewards()   // Staking contract
```

**Contract Reads**
```
previewClaimableEth(address user)
stakingEthPoolBalance()
```

# Transaction Feedback (All Writes)
* Modal step states:
  * Waiting: spinner + “Waiting…”
  * Submitted: tx hash button opens explorer.
  * Confirmed: green check.
  * Error: red icon + “Try Again”.
* Toasts:
  * Pending: “Transaction pending…”
  * Success: “<Action> confirmed”
  * Failure: “<Action> failed: <reason>”
* After success: refetch balances (SSV, cSSV), allowance, claimable ETH, total staked, pending unstake.

# Micro-interactions
* APR card: calculator icon shows tooltip “Staking Calculator” and opens external link.
* Tooltip dots: info tooltip on Current APR and Unstake Cooldown labels.
* Modals:
  * Disable closing on backdrop click.
  * Close controls (top-right “X” + full-width “Close”) appear only after all required steps confirm.
  * Error state shows red icon + “Try Again”; close controls stay hidden.
* Unstake cooldown:
  * Countdown label updates every second.
  * Withdraw button text switches to “Withdraw in Xm Ys…” until unlocked.
* External tx hash buttons open the block explorer in a new tab.
* “Add cSSV to Metamask” button appears only after stake completes.

# Error & Empty States
* Disconnected: all action CTAs show “Connect Wallet”
* Amount empty or zero: CTAs disabled.
* Insufficient balance: surface toast error.
* Insufficient allowance: handled in modal (auto-approval) with retry on error.
* Data unavailable: show “--” placeholders.

# Contract Reads
```
// ERC20 metadata + approvals
decimals()                                   // SSV token
decimals()                                   // cSSV token
allowance(address owner, address spender)

// Staking views
previewClaimableEth(address user)
stakedBalanceOf(address user)
pendingUnstake(address user)   // returns amount, unlockTime
totalStaked()
cooldownDuration()
accEthPerShare()
stakingEthPoolBalance()
```

# Contract Writes
```
approve(address spender, uint256 amount)     // SSV token -> staking contract
stake(uint256 amount)                        // Stake SSV, mint cSSV 1:1
requestUnstake(uint256 amount)               // Burn cSSV, start cooldown
withdrawUnlocked()                           // Withdraw SSV after cooldown
claimEthRewards()                            // Claim ETH rewards
```

# Data Refresh Expectations
* On any confirmed write: refetch wallet balances (SSV), staked balance (cSSV), pending unstake, allowance, claimable ETH, total staked.
* APR is fetched once on entry to the site; show `--` if unavailable.

# FAQ
* Expand/collapse per question.
* Defaults closed unless marked otherwise.
