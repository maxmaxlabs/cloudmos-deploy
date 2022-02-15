import React, { useState, useCallback, useEffect } from "react";
import { useSnackbar } from "notistack";
import { Snackbar } from "../../shared/components/Snackbar";
import axios from "axios";

const TemplatesProviderContext = React.createContext({});

export const TemplatesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  function getTemplateByPath(path) {
    return categories.flatMap((x) => x.templates).find((x) => x.path === path);
  }

  const templates = categories.flatMap((x) => x.templates);

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      const templateEndpoint = "https://raw.githubusercontent.com/Akashlytics/akashlytics-deploy/master/templates.json";
      const response = await axios.get(templateEndpoint);
      let categories = response.data.filter((x) => (x.templates || []).length > 0);
      categories.forEach((c) => {
        c.templates.forEach((t) => (t.category = c.title));
      });
      setCategories(categories);
      setIsLoading(false);
    })();
  }, []);

  return <TemplatesProviderContext.Provider value={{ isLoading, categories, templates, getTemplateByPath }}>{children}</TemplatesProviderContext.Provider>;
};

export const useTemplates = () => {
  return { ...React.useContext(TemplatesProviderContext) };
};
