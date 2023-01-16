const { run } = require("hardhat");

const verify = async (contractAddress, arg) => {
    console.log("开始验证合同");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: arg,
        });
        console.log(contractAddress, "合同验证完成");
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("already verified");
        } else {
            console.log(error);
        }
    }
};
module.exports = { verify };
