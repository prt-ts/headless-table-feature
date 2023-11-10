import { makeStaticStyles, makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const useStaticStyles = makeStaticStyles({
  "*": {
    boxSizing: "border-box",
  }, 
});

export const useTableStaticStyles = makeStyles({

  tableContainer: {
    height: "600px",
    width: "100%",
    ...shorthands.overflow("hidden", "auto"),
    /* width */

    ":hover": {
      ...shorthands.overflow("auto", "auto"),
    },

    "::-webkit-scrollbar": {
      width: "6px",
      height: "4px",
      ...shorthands.borderRadius("50%"),
    },

    /* Track */
    "::-webkit-scrollbar-track": {
      "background-color": "#f1f1f1",
    },

    /* Handle */
    "::-webkit-scrollbar-thumb": {
      "background-color": "#888",
    },

    /* Handle on hover */
    "::-webkit-scrollbar-thumb:hover": {
      "background-color": "#555",
    },
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  tHead: {
    ...shorthands.padding("0px", "0px", "0px", "0px"),
    zIndex: 1,
    backgroundColor: tokens.colorPaletteAnchorBackground2,
    color: tokens.colorNeutralForeground1,

    position: "sticky",
    top: 0,
    width: "100%",
    boxShadow: tokens.shadow2,
  },

  tHeadRow: {
    ...shorthands.padding("0px", "0px", "0px", "0px"),
    ...shorthands.borderBottom(
      tokens.strokeWidthThickest,
      "solid",
      tokens.colorNeutralStroke1
    ),
  },

  tHeadCell: {
    position: "relative",
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightBold,
    minWidth: "1rem", 
    ...shorthands.padding("2px", "4px"),
    ...shorthands.borderLeft("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderRight("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderBottom("1px", "solid", tokens.colorNeutralStroke1),
  },

  tHeadCellContent: {
    display: "flex",
    alignContent: "space-between",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    width: "100%",
    minWidth: "1rem",
    ...shorthands.padding("3px", "4px"),
  },

  tHeadContentBtn: {
    ...shorthands.padding("0px", "0px", "0px", "0px"),
    display: "flex",
    alignContent: "space-between",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    width: "100%",
    height: "100%",
    minWidth: "1rem",
  },

  tHeadMenuPopover: {
    ...shorthands.padding("0px", "0px", "0px", "0px"),
    width: "300px",
  },

  tBody: {
    ...shorthands.padding("0px", "0px", "0px", "0px"),
    zIndex: 0,
  },

  tBodyRow: {
    ...shorthands.padding("0px", "0px", "0px", "0px"),
    ...shorthands.borderBottom(
      tokens.strokeWidthThin,
      "solid",
      tokens.colorNeutralStroke1
    ),
    ":nth-child(even)": {
      backgroundColor: tokens.colorNeutralBackground2,
    },

    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },

  tBodySelectedRow: {
    backgroundColor: tokens.colorBrandBackground2,
    ...shorthands.borderBottom(
      tokens.strokeWidthThin,
      "solid",
      tokens.colorNeutralStroke1
    ),

    ":hover": {
      backgroundColor: tokens.colorBrandBackground2Hover,
    },
  },

  tBodyGroupedRow: {
    backgroundColor: tokens.colorNeutralBackground2,

    ...shorthands.borderBottom(
      tokens.strokeWidthThin,
      "solid",
      tokens.colorNeutralStroke1
    ),
  },

  tBodyCell: {
    backgroundColor: "transparent",
    ...shorthands.padding("2px", "4px"),
    minHeight: "35px",
    height: "35px",
  },
  
  resizer: {
    ...shorthands.borderRight("1px", "solid", tokens.colorNeutralBackground5),

    width: "8px",
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    cursor: "col-resize",
    resize: "horizontal",

    ":hover": {
      borderRightWidth: "4px",
      borderRightColor: tokens.colorNeutralBackground2Pressed,
    },
  },

  resizerActive: {
    borderRightWidth: "4px",
    borderRightColor: tokens.colorNeutralBackground2Pressed,
  },
});
