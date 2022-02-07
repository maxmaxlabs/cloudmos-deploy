import { useState, useEffect } from "react";
import { Box, Avatar, makeStyles, Typography, List, ListItem, Link, ListItemText, ListItemAvatar } from "@material-ui/core";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import removeMarkdown from "markdown-to-text";
import { useTemplates } from "../../context/TemplatesProvider";

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
  const { isLoading, categories } = useTemplates();

  useEffect(() => {
    if (categories?.length > 0) {
      setSelectedCategoryTitle(categories[0].title);
    }
  }, [categories]);

  const selectedCategory = selectedCategoryTitle && categories.find((x) => x.title === selectedCategoryTitle);

  const classes = useStyles();

  function getTemplateSummary(template) {
    if (!template.readme) return null;

    const markdown = template.readme.replace(/^#+ .*\n+/g, "");
    const readmeTxt = removeMarkdown(markdown);
    const maxLength = 200;
    const summary = readmeTxt.length > maxLength ? readmeTxt.substring(0, maxLength - 3) + "..." : readmeTxt;

    return summary;
  }

  return (
    <Box className={classes.root}>
      <Helmet title="Settings" />

      <Box className={classes.titleContainer}>
        <Typography variant="h3" className={classes.title}>
          Template Gallery
        </Typography>
      </Box>

      <Box className={classes.gallery}>
        <List className={classes.categoryList}>
          {categories.map((category) => (
            <ListItem button key={category.title} onClick={() => setSelectedCategoryTitle(category.title)} selected={category.title === selectedCategoryTitle}>
              <ListItemText primary={`${category.title} (${category.templates.length})`} />
            </ListItem>
          ))}
        </List>
        {selectedCategory && selectedCategory.templates && (
          <List className={classes.templateList}>
            {selectedCategory.templates.map((template) => (
              <ListItem button key={template.path} onClick={() => console.log("Template clicked: " + template.title)}>
                <ListItemAvatar>{template.logoUrl && <Avatar src={template.logoUrl} variant="square" />}</ListItemAvatar>
                <ListItemText primary={template.name} secondary={getTemplateSummary(template)} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
