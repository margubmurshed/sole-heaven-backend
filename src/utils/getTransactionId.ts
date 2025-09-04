export const getTransactionId = () => {
    // This function should generate a unique transaction ID
    // For simplicity, we can use a timestamp or a UUID generator
    return `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}
