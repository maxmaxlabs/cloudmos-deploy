import { CircularProgress } from "@material-ui/core";
import { usePrice } from "../../context/PriceProvider";
import { FormattedNumber } from "react-intl";
import { ceilDecimal } from "../utils/math";

export const PriceValue = ({ value }) => {
  const { priceData, isLoadingPriceData } = usePrice();
  const _value = Number(value) * priceData?.price;
  const computedValue = ceilDecimal(_value);

  return (
    <>
      {isLoadingPriceData && !priceData && <CircularProgress size="1rem" />}
      {priceData && _value !== computedValue && "< "}
      {priceData && <FormattedNumber value={computedValue} style="currency" currency="USD" />}
    </>
  );
};
