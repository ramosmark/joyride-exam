const hammingDistance = (x, y) => {
    if (x < 0 || y > 231) {
        return 'distance must be between 0 to 231'
    }

    return (x ^ y).toString(2).match(/1/g).length
}