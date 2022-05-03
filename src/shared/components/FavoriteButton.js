import { IconButton } from "@material-ui/core";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import StarIcon from "@material-ui/icons/Star";

export const FavoriteButton = ({ onClick, isFavorite }) => {
  return (
    <IconButton onClick={onClick} size="small">
      {isFavorite ? <StarIcon fontSize="small" color="primary" /> : <StarBorderIcon fontSize="small" />}
    </IconButton>
  );
};
