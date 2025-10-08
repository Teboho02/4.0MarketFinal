
const PriceFormatter = ({ price }) => {
  const formatPrice = (price) => {
    return `R${parseFloat(price).toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  return <>{formatPrice(price)}</>
}

export default PriceFormatter