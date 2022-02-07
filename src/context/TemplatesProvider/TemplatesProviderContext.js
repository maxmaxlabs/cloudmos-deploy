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

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      const templateEndpoint =
        "https://gist.githubusercontent.com/Redm4x/60fee97d622a8d6a97777e29f5e738fd/raw/5fcbccd3c1a8ed5c690c03e9346df6e04e485e7b/Test.json";
      const response = await axios.get(templateEndpoint);
      let categories = response.data.filter((x) => (x.templates || []).length > 0);
      setCategories(categories);
      setIsLoading(false);
    })();
  }, []);

  return <TemplatesProviderContext.Provider value={{ isLoading, categories, getTemplateByPath }}>{children}</TemplatesProviderContext.Provider>;
};

export const useTemplates = () => {
  return { ...React.useContext(TemplatesProviderContext) };
};
