const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
// developmentChains
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe;
          let deployer;
          let mockV3Aggregator;
          // const sendValue = (1e18).toString();
          const sendValue = ethers.utils.parseEther("1");
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);
              fundMe = await ethers.getContract("FundMe", deployer);
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
              // console.log(mockV3Aggregator);
          });
          describe("constructor", async () => {
              it("sets the aggregator addresses correctly", async () => {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });

          describe("fund", async () => {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  );
              });
              it("update the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  );
                  assert.equal(response.toString(), sendValue);
              });
              it("Adds funder to array of funders", async () => {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.getFunder(0);
                  assert.equal(funder, deployer);
              });
          });
          describe("withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });
              it("Withdraw ETH From a single founder", async () => {
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  // console.log(startingDeployerBalance.toString());
                  // console.log(startingFundMeBalance.toString());
                  // console.log(network.name);

                  // assert.equal(startingDeployerBalance, )
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      //  提取资金 需要从中扣除gas费
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });
              it("allows us to withdraw with multiple funders", async () => {
                  const accounts = await ethers.getSigners();
                  console.log(accounts.length, "accounts");
                  // 第零个是自己
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      //  提取资金 需要从中扣除gas费
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  await expect(fundMe.getFunder(0)).to.be.reverted;
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });
              it("only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners();
                  // console.log(accounts.length);
                  // assert(1, 1);
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(attackerConnectedContract.withdraw()).to.be
                      .reverted;
              });
          });
          describe("cheaperWithdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });
              it("Withdraw ETH From a single founder", async () => {
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  // console.log(startingDeployerBalance.toString());
                  // console.log(startingFundMeBalance.toString());
                  // console.log(network.name);

                  // assert.equal(startingDeployerBalance, )
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      //  提取资金 需要从中扣除gas费
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });
              it("allows us to withdraw with multiple funders", async () => {
                  const accounts = await ethers.getSigners();
                  console.log(accounts.length, "accounts");
                  // 第零个是自己
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      //  提取资金 需要从中扣除gas费
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  await expect(fundMe.getFunder(0)).to.be.reverted;
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });
              it("only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners();
                  // console.log(accounts.length);
                  // assert(1, 1);
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(attackerConnectedContract.cheaperWithdraw()).to
                      .be.reverted;
              });
          });
      });
