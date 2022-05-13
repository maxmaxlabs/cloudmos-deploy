import { useState, useEffect } from "react";
import { Box, Avatar, TextField, makeStyles, Typography, List, ListItem, ListItemText, ListItemAvatar, IconButton } from "@material-ui/core";
import { Helmet } from "react-helmet-async";
import { useTemplates } from "../../context/TemplatesProvider";
import { Link } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { ViewPanel } from "../../shared/components/ViewPanel";
import ImageIcon from "@material-ui/icons/Image";
import { useHistory } from "react-router-dom";
import { useQueryParams } from "../../hooks/useQueryParams";
import CloseIcon from "@material-ui/icons/Close";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";

const useStyles = makeStyles((theme) => ({
  gallery: {
    display: "flex"
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold"
  },
  categoryList: {
    flexBasis: "280px"
  },
  templateList: {
    flexBasis: 0,
    flexGrow: 999,
    "& .MuiAvatar-img": {
      objectFit: "contain"
    }
  },
  logoPlaceholder: {
    width: "2.7rem",
    height: "2.7rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.grey[300],
    borderRadius: "50%"
  }
}));

let timeoutId = null;

export function TemplateGallery(props) {
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState(null);
  const [searchTerms, setSearchTerms] = useState("");
  const [searchTermsUsed, setSearchTermsUsed] = useState(null);
  const { isLoading, categories, templates } = useTemplates();
  const query = useQueryParams();
  const history = useHistory();
  const selectedCategory = selectedCategoryTitle && categories.find((x) => x.title === selectedCategoryTitle);
  const classes = useStyles();
  const searchTermsSplit = searchTermsUsed?.split().map((x) => x.toLowerCase());
  const searchResults =
    searchTermsSplit && templates.filter((x) => searchTermsSplit.some((s) => x.name.toLowerCase().includes(s) || x.readme.toLowerCase().includes(s)));

  useEffect(() => {
    const queryCategory = query.get("category");
    const querySearch = query.get("search");

    if (queryCategory) {
      setSelectedCategoryTitle(queryCategory);
    }

    if (querySearch) {
      setSearchTerms(querySearch);
      setSearchTermsUsed(querySearch);
    }

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const queryCategory = query.get("category");
    if (categories?.length > 0 && !queryCategory) {
      setSelectedCategoryTitle(categories[0].title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const onSearchChange = (event) => {
    const searchValue = event.target.value;
    setSearchTerms(searchValue);

    if (searchValue) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSearchTermsUsed(searchValue);

        history.replace(UrlService.templates(selectedCategoryTitle, searchValue));
      }, 300);
    } else {
      setSearchTermsUsed(searchValue);
      history.replace(UrlService.templates(selectedCategoryTitle, searchValue));
    }
  };

  const onCategoryClick = (categoryTitle) => {
    setSelectedCategoryTitle(categoryTitle);
    history.replace(UrlService.templates(categoryTitle, searchTerms));
  };

  const onClearSearch = () => {
    setSearchTerms("");
    setSearchTermsUsed("");
  };

  return (
    <>
      <Helmet title="Template Gallery" />

      <LinearLoadingSkeleton isLoading={isLoading} />

      <Box padding="1rem">
        <Typography variant="h3" className={classes.title}>
          Template Gallery
        </Typography>

        <Box paddingTop={2}>
          These templates come from the{" "}
          <a href="https://github.com/ovrclk/awesome-akash" target="_blank" rel="noreferrer">
            Awesome Akash
          </a>{" "}
          repository.
        </Box>

        <TextField
          fullWidth
          label="Search"
          disabled={isLoading}
          value={searchTerms}
          onChange={onSearchChange}
          InputProps={{
            endAdornment: searchTerms && (
              <IconButton onClick={onClearSearch} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            )
          }}
        />
      </Box>

      {searchTermsUsed || searchTerms ? (
        <ViewPanel bottomElementId="footer" overflow="auto" className={classes.templateList}>
          <List className={classes.templateList}>
            {searchResults?.map((template) => (
              <ListItem button key={template.id} component={Link} to={UrlService.templateDetails(template.id)}>
                <ListItemAvatar>
                  {template.logoUrl ? (
                    <Avatar src={template.logoUrl} variant="square" />
                  ) : (
                    <div className={classes.logoPlaceholder}>
                      <ImageIcon />
                    </div>
                  )}
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <>
                      {template.name} - <strong>{template.category}</strong>
                    </>
                  }
                  secondary={template.summary}
                />
              </ListItem>
            ))}
          </List>
        </ViewPanel>
      ) : (
        <>
          <Box className={classes.gallery}>
            <ViewPanel bottomElementId="footer" overflow="auto" className={classes.categoryList}>
              <List>
                {categories
                  .sort((a, b) => (a.title < b.title ? -1 : 1))
                  .map((category) => (
                    <ListItem button key={category.title} onClick={() => onCategoryClick(category.title)} selected={category.title === selectedCategoryTitle}>
                      <ListItemText primary={`${category.title} (${category.templates.length})`} />
                    </ListItem>
                  ))}
              </List>
            </ViewPanel>

            {selectedCategory && selectedCategory.templates && (
              <ViewPanel bottomElementId="footer" overflow="auto" className={classes.templateList}>
                <List>
                  {selectedCategory.templates.map((template) => (
                    <ListItem button key={template.id} component={Link} to={UrlService.templateDetails(template.id)}>
                      <ListItemAvatar>
                        {template.logoUrl ? (
                          <Avatar src={template.logoUrl} variant="square" />
                        ) : (
                          <div className={classes.logoPlaceholder}>
                            <ImageIcon />
                          </div>
                        )}
                      </ListItemAvatar>
                      <ListItemText primary={template.name} secondary={template.summary} />
                    </ListItem>
                  ))}
                </List>
              </ViewPanel>
            )}
          </Box>
        </>
      )}
    </>
  );
}
