import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {render as rtlRender} from"@testing-library/react"; 
import { ReactElement } from "react";



const qc = new QueryClient();
export const render = (  ui: ReactElement
    ) : ReturnType<typeof rtlRender> => {

    return rtlRender(<QueryClientProvider client={qc}>
        {ui}
    </QueryClientProvider>)
}