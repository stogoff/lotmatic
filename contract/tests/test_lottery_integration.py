from brownie import network, config
import pytest
from scripts.helpful_scripts import (
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
    get_account,
    fund_with_link,
)
from scripts.deploy_lottery import deploy_lottery


def test_can_pick_winner():
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip()
    lottery = deploy_lottery()  # block r-4  k-11
    account = get_account()
    lottery.startLottery({"from": account})  # block r k
    lottery.enter({"from": account, "value": lottery.getEntranceFee()})  # block r+1 k+1
    lottery.enter({"from": account, "value": lottery.getEntranceFee()})  # block r+2 k+2
    fund_with_link(
        lottery, amount=config["networks"][network.show_active()]["fee"]
    )  # block r+3 k+3
    tx = lottery.endLottery({"from": account})  # block r+4 k+4
    tx.wait(15)
    assert lottery.recentWinner() == account  # result at block r+15 k+15
    assert lottery.balance() == 0
