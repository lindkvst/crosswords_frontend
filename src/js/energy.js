// Energy is small for one call, so mWh reads better than 0.0012 Wh.
export function formatWh(wh) {
    if (wh < 1) {
        return `${(wh * 1000).toLocaleString("da-DK", { maximumFractionDigits: 1 })} mWh`;
    }
    return `${wh.toLocaleString("da-DK", { maximumFractionDigits: 2 })} Wh`;
}
