import { makeStyles } from "@fluentui/react-components";

export const usePaginationStyle = makeStyles({
  wrapper: {
    columnGap: "0.2rem",
    display: "flex",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "space-between", 
    
    // if smaller size display flex column
    "@media screen and (max-width: 640px)": {
      flexDirection: "column",
      rowGap: "0.2rem",
    },
  },
  pageBtnContainer: {
    display: "flex",
    columnGap: "3px",
  },
  pageBtn: {
    minWidth: "1.5rem",
    minHeight: "1.5rem",
    alignContent: "center",
    alignItems: "center",
  },
  pageSelectionWrapper: {
    minWidth: "1.5rem",
  },
  pageSelectionDropdown: {
    minWidth: "100%",
  },
  pageSizeInput: {
    minWidth: "1.5rem",
    width: "4rem",
  },
});
