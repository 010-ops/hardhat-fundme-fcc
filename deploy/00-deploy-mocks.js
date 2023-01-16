const { network } = require("hardhat");
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config.js");
module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    // const chianId = network.config.chianId;
    // const ethUsedPriceFeedAddress = networkConfig[chianId]["ethUsedPriceFeed"];
    if (developmentChains.includes(network.name)) {
        log("开始部署");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
            // waitConfirmations: network.config.blockConfirmations || 1,
        }).catch((err) => {
            console.error(err);
        });
        log("Mocks 部署完成");
        log("-------------------------------");
    }
};
module.exports.tags = ["all", "mocks"];
