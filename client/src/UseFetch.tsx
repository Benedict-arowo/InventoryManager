import { SERVER_URL } from "./utils";

type useFetchProps = {
  url: string;
  options: {
    method: "GET" | "PATCH" | "DELETE" | "POST" | "PUT";
    body?: object;
    returnResponse?: boolean;
    useServerUrl: boolean;
    useAuth: boolean;
  };
};

// type returnObj = {
//   data?: object;
//   error?: object;
// };

const UseFetch = async ({ url, options }: useFetchProps) => {
  // Attempts to get access token from localhost
  const stringifiedToken = localStorage.getItem("access-token");
  let accessToken;
  if (stringifiedToken) accessToken = JSON.parse(stringifiedToken) as string;

  if (options.useAuth && !accessToken) throw new Error("Missing access token.");

  const response = await fetch(
    `${options.useServerUrl ? `${SERVER_URL}/` : ""}${url}`,
    {
      method: options.method ? options.method : "GET",
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = await response.json();

  if (options.returnResponse) {
    return { data, response };
  } else {
    return { data };
  }
};

export default UseFetch;
