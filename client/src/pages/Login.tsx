import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { useState } from "react";
import { SERVER_URL } from "../utils";

const Login = () => {
  const [details, setDetails] = useState({
    username: "",
    password: "",
  });

  const loginUser = () => {
    if (!details.username) throw new Error("Please enter a username");
    if (!details.password) throw new Error("Please enter a password");

    fetch(`${SERVER_URL}/api-auth/token/`, {
      body: JSON.stringify(details),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        localStorage.setItem("access-token", JSON.stringify(data.access));
        localStorage.setItem("refresh-token", JSON.stringify(data.refresh));
        alert("Logged In Successfully");
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="w-full h-screen grid place-content-center overflow-hidden bg-slate-700">
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
        </div>
      </section>
    </div>
  );
};

export default Login;
