import { loginUser } from "../services/auth.service.js";
import { formatResponse } from "../utils/response.js";

export const login = async (req, res) => {
  const { email, password, phonenumber } = req.body;

  try {
    const { token, user } = await loginUser({ email, password, phonenumber });

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Login successful",
        data: {
          token,
          user,
        },
      })
    );

    
  } catch (error) {
    if (error.message === "Invalid credentials") {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: error.message,
        })
      );
    }

    console.error("Login error", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Server error",
      })
    );
  }
};
