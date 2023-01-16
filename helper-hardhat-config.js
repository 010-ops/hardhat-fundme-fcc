const networkConfig = {
    5: {
        name: "goerli",
        ethUsedPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
};
const developmentChains = ["localhost", "hardhat"];
const DECIMALS = 8;
const INITIAL_ANSWER = 20000000000;
module.exports = {
    DECIMALS,
    INITIAL_ANSWER,
    networkConfig,
    developmentChains,
};
