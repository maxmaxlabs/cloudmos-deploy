import React from "react";
import { useTemplates as useTemplatesQuery } from "../../queries/useTemplatesQuery";

const TemplatesProviderContext = React.createContext({});

export const TemplatesProvider = ({ children }) => {
  const { data, isFetching: isLoading } = useTemplatesQuery();
  const categories = data ? data.categories : [];
  const templates = data ? data.templates : [];

  function getTemplateByPath(path) {
    return categories.flatMap((x) => x.templates).find((x) => x.path === path);
  }

  return <TemplatesProviderContext.Provider value={{ isLoading, categories, templates, getTemplateByPath }}>{children}</TemplatesProviderContext.Provider>;
};

export const useTemplates = () => {
  return { ...React.useContext(TemplatesProviderContext) };
};
