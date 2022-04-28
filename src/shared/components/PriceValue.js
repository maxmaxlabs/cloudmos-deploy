import { CircularProgress } from "@material-ui/core";
import { usePrice } from "../../context/PriceProvider";
import { FormattedNumber } from "react-intl";
import { ceilDecimal } from "../utils/math";

export const PriceValue = ({ value, showLt }) => {
  const { priceData, isLoadingPriceData } = usePrice();
  const _value = parseFloat(value) * priceData?.price;
  const computedValue = _value > 0 ? ceilDecimal(_value) : 0;

  return (
    <>
      {isLoadingPriceData && !priceData?.price && <CircularProgress size=".8rem" />}
      {showLt && priceData?.price && _value !== computedValue && "< "}
      {priceData?.price && (
        <FormattedNumber
          value={computedValue}
          // eslint-disable-next-line react/style-prop-object
          style="currency"
          currency="USD"
        />
      )}
    </>
  );
};
