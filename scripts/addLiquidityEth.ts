import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
  const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

  const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

  await helpers.impersonateAccount(TOKEN_HOLDER);
  const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

  const amountUSDCDesired = ethers.parseUnits("1000", 6);
  const amountUSDCMin = ethers.parseUnits("1", 6);

  const amountETHMin = ethers.parseEther("0.1");
  const amountETH = ethers.parseEther("10");

  const USDC_Contract = await ethers.getContractAt(
    "IERC20",
    USDC,
    impersonatedSigner
  );

  const ROUTER = await ethers.getContractAt(
    "IUniswapV2Router",
    ROUTER_ADDRESS,
    impersonatedSigner
  );

  await USDC_Contract.approve(ROUTER, amountUSDCDesired);

  const usdcBal = await USDC_Contract.balanceOf(impersonatedSigner.address);

  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  console.log("usdc balance before adding Liquidity ETH: ", Number(usdcBal));
  //   console.log("dai balance before adding Liquidity", Number(daiBal));
  let ethBal = await ethers.provider.getBalance(impersonatedSigner);
  console.log("ETH balance before adding liquidity ETH: ", ethBal);

  const addLiquidityEthTx = await ROUTER.addLiquidityETH(
    USDC,
    amountUSDCDesired,
    amountUSDCMin,
    amountETHMin,
    impersonatedSigner,
    deadline,
    { value: amountETH }
  );

  addLiquidityEthTx.wait();

  console.log("add liquidity ETH Tx: ", addLiquidityEthTx);

  const usdcBalAfter = await USDC_Contract.balanceOf(
    impersonatedSigner.address
  );

  ethBal = await ethers.provider.getBalance(impersonatedSigner);
  console.log("ETH balance after adding liquidty ETH: ", ethBal);

  console.log("=========================================================");

  console.log("usdc balance after adding liquidity ETH: ", Number(usdcBalAfter));
  //   console.log("dai balance after adding liquidity", Number(daiBalAfter));

  // remove liquidity ETH

  console.log("=========================================================");
  console.log("=========================================================");

  console.log("usdc balance before removing liquidity ETH: ", Number(usdcBalAfter));
  ethBal = await ethers.provider.getBalance(impersonatedSigner);
  console.log("ETH balance before removing liquidity ETH: ", ethBal);

  const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const UNISWAP_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  const FACTORY_CONTRACT = await ethers.getContractAt(
    "IUniswapV2Factory",
    UNISWAP_FACTORY
  );
  const pairAddress = await FACTORY_CONTRACT.getPair(USDC, WETH);
  const pairContract = await ethers.getContractAt(
    "IUniswapV2Pair",
    pairAddress,
    impersonatedSigner
  );

  const liquidityAdded = await pairContract.balanceOf(impersonatedSigner);

  const liquidityToBeRemoved = liquidityAdded - BigInt(100);

  await pairContract.approve(ROUTER_ADDRESS, liquidityToBeRemoved);


  const removeLiquidityETHTx = await ROUTER.removeLiquidityETH(
    USDC,
    liquidityToBeRemoved,
    amountUSDCMin,
    amountETHMin,
    impersonatedSigner,
    deadline
  );

  removeLiquidityETHTx.wait();

  console.log("Remove Liquidity ETH Tx: ",removeLiquidityETHTx);

  const usdcBalAfterRemovingLiquidity = await USDC_Contract.balanceOf(
    impersonatedSigner.address
  );

  ethBal = await ethers.provider.getBalance(impersonatedSigner);
  
  console.log("ETH balance after removing liquidty ETH: ", ethBal);

  console.log(
    "usdc balance after removing Liquidity ETH: ",
    Number(usdcBalAfterRemovingLiquidity)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
