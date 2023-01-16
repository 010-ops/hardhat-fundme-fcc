const { network } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config.js");
const { verify } = require("../utils/verify.js");
module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chianId = network.config.chainId;
    let ethUsedPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        ethUsedAggregator = await deployments.get("MockV3Aggregator");
        ethUsedPriceFeedAddress = ethUsedAggregator.address;
    } else {
        ethUsedPriceFeedAddress = networkConfig[chianId]["ethUsedPriceFeed"];
    }
    log("开始部署FundMe");
    const args = [ethUsedPriceFeedAddress];
    const FundMe = await deploy("FundMe", {
        // contract: "FundMe",
        from: deployer,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
        args,
    });
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(FundMe.address, args);
    }
    log("部署FundMe完成");
    log("-------------------");
};
module.exports.tags = ["all", "fundme"];
