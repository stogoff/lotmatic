import json


def abi_to_react():
    with open("build/contracts/Lottery.json", "r") as file:
        j = json.load(file)
    with open("../src/abi.json", "w") as file:
        json.dump(j["abi"], file, indent=4)
    print("Done")


def main():
    print("Run it from brownie/lottery directory")
    abi_to_react()


if __name__ == "__main__":
    main()
