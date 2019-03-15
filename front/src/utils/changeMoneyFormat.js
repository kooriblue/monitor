export function changeMoneyFormat(money) {
    var payAmount = parseInt(money) * 1.0 / 100;
    return payAmount.toFixed(2);
}