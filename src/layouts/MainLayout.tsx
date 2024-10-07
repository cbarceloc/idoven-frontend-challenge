import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { PropsWithChildren } from "react";

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Idoven.ai Coding Challenge</Typography>
        </Toolbar>
      </AppBar>
      <Box p={4} component="main">
        {children}
      </Box>
    </>
  );
}
