import React from "react";
import { useTemplates as useTemplatesQuery } from "../../queries";

const TemplatesProviderContext = React.createContext({});

export const TemplatesProvider = ({ children }) => {
  const { data, isFetching: isLoading } = useTemplatesQuery();
  const categories = data ? data.categories : [];
  const templates = data ? data.templates : [];

  function getTemplateById(id) {
    return categories.flatMap((x) => x.templates).find((x) => x.id === id);
  }

  return <TemplatesProviderContext.Provider value={{ isLoading, categories, templates, getTemplateById }}>{children}</TemplatesProviderContext.Provider>;
};

export const useTemplates = () => {
  return { ...React.useContext(TemplatesProviderContext) };
};
