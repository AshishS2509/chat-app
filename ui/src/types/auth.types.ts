export type TLogin = {
  email: string;
  password: string;
};

export type TUser = {
  _id: string;
  name: string;
  email: string;
  isLoggedIn?: boolean;
};

export type TRegisterUser = {
  name: string;
  email: string;
  password: string;
};
