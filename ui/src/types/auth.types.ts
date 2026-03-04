export type TLogin = {
  email: string;
  password: string;
};

export type TUser = {
  name: string;
  email: string;
  isLoggedIn?: boolean;
};

export type TRegisterUser = {
  name: string;
  email: string;
  password: string;
};
