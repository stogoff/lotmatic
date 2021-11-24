from scripts.abi_to_react import abi_to_react
from scripts.helpful_scripts import fund_with_link, get_account, get_contract
from brownie import Lottery, network, config
import time
import sys


def deploy_lottery():

    network_name = network.show_active()
    if network_name == "polygon-main":
        account = get_account(id="RealLotteryMaker")
    else:
        account = get_account()
    if "polygon" in network_name:
        feed = "matic_usd_price_feed"
    else:
        feed = "eth_usd_price_feed"
    lottery = Lottery.deploy(
        get_contract(feed).address,
        get_contract("vrf_coordinator").address,
        get_contract("link_token").address,
        config["networks"][network_name]["fee"],
        config["networks"][network_name]["keyhash"],
        config["networks"][network_name]["min_usd"],
        {"from": account},
        publish_source=config["networks"][network_name].get("verify", False),
    )
    print("Deployed lottery!")
    return lottery


def start_lottery():
    account = get_account()
    lottery = Lottery[-1]
    starting_tx = lottery.startLottery({"from": account})
    starting_tx.wait(1)
    print("The lottery is started!")


def enter_lottery():
    account = get_account()
    lottery = Lottery[-1]
    value = lottery.getEntranceFee() + 100000000
    tx = lottery.enter({"from": account, "value": value})
    tx.wait(1)
    print("You entered the lottery!")


def end_lottery():
    account = get_account()
    lottery = Lottery[-1]
    # fund the contract
    # then end the lottery
    tx = fund_with_link(
        lottery.address, amount=config["networks"][network.show_active()]["fee"]
    )
    # tx.wait(1) ## already done
    ending_transaction = lottery.endLottery({"from": account})
    print("Waiting for 2 blocks...")
    ending_transaction.wait(2)
    print("Sleeping for 120s...")
    time.sleep(120)
    print(f"{lottery.recentWinner()} is the new winner!")


def main():

    deploy_lottery()
    abi_to_react()
    sys.exit()
    start_lottery()
    enter_lottery()
    end_lottery()
