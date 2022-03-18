import { useState, useEffect } from "react";
import { Box, Avatar, TextField, makeStyles, Typography, List, ListItem, ListItemText, ListItemAvatar, CircularProgress } from "@material-ui/core";
import { Helmet } from "react-helmet-async";
import { useTemplates } from "../../context/TemplatesProvider";
import { Link } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { ViewPanel } from "../../shared/components/ViewPanel";
import ImageIcon from "@material-ui/icons/Image";

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
      <Helmet title="Template Gallery" />

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

        <TextField fullWidth label="Search" disabled={isLoading} value={searchTerms} onChange={(ev) => setSearchTerms(ev.target.value)} />
      </Box>

      {searchTermsUsed ? (
        <ViewPanel bottomElementId="footer" overflow="auto" className={classes.templateList}>
          <List className={classes.templateList}>
            {searchResults.map((template) => (
              <ListItem button key={template.path} component={Link} to={UrlService.templateDetails(template.path)}>
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
          {isLoading && (
            <Box textAlign="center">
              <CircularProgress />
            </Box>
          )}

          <Box className={classes.gallery}>
            <ViewPanel bottomElementId="footer" overflow="auto" className={classes.categoryList}>
              <List>
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
            </ViewPanel>

            {selectedCategory && selectedCategory.templates && (
              <ViewPanel bottomElementId="footer" overflow="auto" className={classes.templateList}>
                <List>
                  {selectedCategory.templates.map((template) => (
                    <ListItem button key={template.path} component={Link} to={UrlService.templateDetails(template.path)}>
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

                  {selectedCategory?.title === "Blockchain" && (
                    <ListItem button onClick={() => window.electron.openUrl("https://github.com/ovrclk/cosmos-omnibus")}>
                      <ListItemAvatar>
                        <div className={classes.logoPlaceholder}>
                          <ImageIcon />
                        </div>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Cosmos Omnibus"
                        secondary={"Visit the Cosmos Omnibus repository for templates to deploy cosmos-sdk-based docker images and configuration onto Akash."}
                      />
                    </ListItem>
                  )}
                </List>
              </ViewPanel>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
