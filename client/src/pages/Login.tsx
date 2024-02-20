import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { useState } from "react";
import { SERVER_URL } from "../utils";
import { useNavigate } from "react-router-dom";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";

const Login = () => {
  const [details, setDetails] = useState({
    username: "",
    password: "",
  });
  const [err, setErr] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);

  const Navigate = useNavigate();
  const loginUser = () => {
    if (!details.username) return setErr("Username must be provided");
    if (!details.password) return setErr("Please enter a password");

    setErr(null);
    setIsLoading(true);

    fetch(`${SERVER_URL}/api-auth/token/`, {
      body: JSON.stringify(details),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Error while trying to log user in.");
        return response.json();
      })
      .then((data) => {
        localStorage.setItem("access-token", JSON.stringify(data.access));
        localStorage.setItem("refresh-token", JSON.stringify(data.refresh));
        Navigate("/dashboard");
      })
      .catch((err) => {
        console.log(err);
        return setErr(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="w-full h-screen grid place-content-center gap-2 overflow-hidden bg-slate-700">
      <section className="w-fit px-4 pt-2 pb-6 bg-neutral-200">
        <div className="flex flex-col gap-2 mt-4">
          <InputText
            value={details.username}
            onChange={(e) =>
              setDetails((prev) => ({ ...prev, username: e.target.value }))
            }
            placeholder="Username"
          />

          <Password
            value={details.password}
            onChange={(e) =>
              setDetails((prev) => ({ ...prev, password: e.target.value }))
            }
            feedback={false}
            toggleMask
            placeholder="Password"
          />

          <Button onClick={loginUser} className="mt-2" label="Login" />
          {isLoading && (
            <ProgressSpinner style={{ width: "30px", height: "30px" }} />
          )}
        </div>
      </section>
      {err && <Message severity="error" text={err} />}
    </div>
  );
};

export default Login;
