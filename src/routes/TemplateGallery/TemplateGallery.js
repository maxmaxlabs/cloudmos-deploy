import { useState, useEffect } from "react";
import { Box, Avatar, TextField, makeStyles, Typography, List, ListItem, ListItemText, ListItemAvatar } from "@material-ui/core";
import { Helmet } from "react-helmet-async";
import { useTemplates } from "../../context/TemplatesProvider";
import { Link } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";

const useStyles = makeStyles((theme) => ({
  root: { padding: "1rem" },
  gallery: {
    display: "flex"
  },
  title: {
    fontSize: "2rem",
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
  }
}));

export function TemplateGallery(props) {
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState(null);
  const [searchTerms, setSearchTerms] = useState("");
  const [searchTermsUsed, setSearchTermsUsed] = useState(null);
  const { isLoading, categories, templates } = useTemplates();

  useEffect(() => {
    if (categories?.length > 0) {
      setSelectedCategoryTitle(categories[0].title);
    }
  }, [categories]);

  useEffect(() => {
    let timeoutId = null;
    if (searchTerms) {
      timeoutId = setTimeout(() => {
        setSearchTermsUsed(searchTerms);
      }, 300);
    } else {
      setSearchTermsUsed(searchTerms);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchTerms]);

  const selectedCategory = selectedCategoryTitle && categories.find((x) => x.title === selectedCategoryTitle);

  const classes = useStyles();

  const searchTermsSplit = searchTermsUsed?.split().map((x) => x.toLowerCase());
  const searchResults =
    searchTermsSplit && templates.filter((x) => searchTermsSplit.some((s) => x.name.toLowerCase().includes(s) || x.readme.toLowerCase().includes(s)));

  return (
    <Box className={classes.root}>
      <Box className={classes.titleContainer}>
        <Typography variant="h3" className={classes.title}>
          Template Gallery
        </Typography>
      </Box>

      <Box paddingTop={2}>
        These templates come from the{" "}
        <a href="https://github.com/ovrclk/awesome-akash" target="_blank">
          Awesome Akash
        </a>{" "}
        repository.
      </Box>

      <TextField fullWidth label="Search" value={searchTerms} onChange={(ev) => setSearchTerms(ev.target.value)} />

      {searchTermsUsed ? (
        <List className={classes.templateList}>
          {searchResults.map((template) => (
            <ListItem button key={template.path} component={Link} to={UrlService.templateDetails(template.path)}>
              <ListItemAvatar>{template.logoUrl && <Avatar src={template.logoUrl} variant="square" />}</ListItemAvatar>
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
      ) : (
        <Box className={classes.gallery}>
          <List className={classes.categoryList}>
            {categories
              .sort((a, b) => (a.title < b.title ? -1 : 1))
              .map((category) => (
                <ListItem
                  button
                  key={category.title}
                  onClick={() => setSelectedCategoryTitle(category.title)}
                  selected={category.title === selectedCategoryTitle}
                >
                  <ListItemText primary={`${category.title} (${category.templates.length})`} />
                </ListItem>
              ))}
          </List>
          {selectedCategory && selectedCategory.templates && (
            <List className={classes.templateList}>
              {selectedCategory.templates.map((template) => (
                <ListItem button key={template.path} component={Link} to={UrlService.templateDetails(template.path)}>
                  <ListItemAvatar>{template.logoUrl && <Avatar src={template.logoUrl} variant="square" />}</ListItemAvatar>
                  <ListItemText primary={template.name} secondary={template.summary} />
                </ListItem>
              ))}

              {selectedCategory?.title === "Blockchain" && (
                <ListItem button onClick={() => window.electron.openUrl("https://github.com/ovrclk/cosmos-omnibus")}>
                  <ListItemAvatar></ListItemAvatar>
                  <ListItemText
                    primary="Cosmos Omnibus"
                    secondary={"Visit the Cosmos Omnibus repository for templates to deploy cosmos-sdk-based docker images and configuration onto Akash."}
                  />
                </ListItem>
              )}
            </List>
          )}
        </Box>
      )}
    </Box>
  );
}
