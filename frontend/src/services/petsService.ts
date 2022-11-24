import { Configuration } from "../generated";
import {DefaultApi} from "../generated/apis/DefaultApi";

export const petsApi = new DefaultApi(new Configuration({
    basePath: "/api"
})); 

