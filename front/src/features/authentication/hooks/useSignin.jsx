import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signIn } from "../../../state/userSlice/userSlice"; 

const useSignin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.user); 

  const handleSignin = async (e) => {
    e.preventDefault();
    dispatch(signIn({ email, password })); 
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleSignin,
    isLoading: loading,
    error,
  };
};

export default useSignin;
