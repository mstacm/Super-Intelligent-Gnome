import {
  Category,
  CategoryServiceFactory,
  CategoryConfiguration,
  LogLevel
} from "typescript-logging";

// Sets default logging to INFO
CategoryServiceFactory.setDefaultConfiguration(
  new CategoryConfiguration(LogLevel.Info)
);

export const logBot = new Category("gnome");
