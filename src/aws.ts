import {GetParameterCommand, GetParameterRequest, SSMClient} from "@aws-sdk/client-ssm";
import {updateDotenv} from "./index";

const AWS_REGION = process.env.AWS_REGION ?? 'us-east-1';


type MyParam = { name: string; path: string };

const client = new SSMClient({region: AWS_REGION});

const getParam = async (item: MyParam) => {
    const params: GetParameterRequest = {Name: item.path};
    const command = new GetParameterCommand(params);

    try {
        const data = await client.send(command);
        return {name: item.name, value: data?.Parameter?.Value ?? 'N/A'};
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
        console.log(error.message);
    }
    return {name: item.name, value: 'NOT FOUND'};
};

const getParams = async (fetchParams: MyParam[]) => Promise.all(fetchParams.map(async (item) => await getParam(item)));

export const updateValuesFromSSM = async (parameters: MyParam[], FRAMEWORK_PREFIX: string = '') => {
    const params = await getParams(parameters);
    const obj: { [key: string]: string } = {};

    params.forEach((i) => {
        obj[`${FRAMEWORK_PREFIX}${i.name}`] = i.value;
        console.log(`Parameter ${i.name} set to ${i.value}`);
    });
    obj[`${FRAMEWORK_PREFIX}AWS_REGION`] = AWS_REGION;

    await updateDotenv(obj);
};