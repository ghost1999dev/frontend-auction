export interface userResponse{
    message: string;
    usersWithImage: usersWithImage[]
}

export interface userResponseById{
    status: boolean;
    message: string;
    user: usersWithImage[]
}

export interface usersWithImage{
    id: number;
    role_id: number;
    name: string;
    email: string;
    address: string;
    phone: string
    image: string;
    account_type: number;
    status: boolean;
    last_login: string;
    updatedAt: string;
}

export interface UserAuth{
    email: string;
    password: string;
}

export interface UserResponseAuth{
    token: string;
    message: string;
}

export interface activateReq{
    email: string;
}

export interface activateRes{
    message: string;
    status: number;
}

export interface addUser{
    role_id: number;
    name: string;
    email: string;
    code: string;
    password: string;
    address: string;
    phone: string
    image: string;
    account_type: number;
}

export interface updateUser{
    name: string, 
    address: string, 
    phone: string
}

export interface updatePasswordUser{
    currentPassword: string, 
    Newpassword: string
}

export interface updatePasswordUserResponse{
    message: string
    user: addUserResUserObject[]
}

export interface updateUserResponse{
    message: string
    user: addUserResUserObject[]
}

export interface updateUserErrorResponse{
    status: boolean;
    message: string;
}

export interface addUserResponse{
    id: number;
    message: string
    user: addUserResUserObject[]
}

export interface addUserResUserObject{
    id: number;
    role_id: number;
    name: string;
    email: string;
    code: string;
    password: string;
    address: string;
    phone: string
    image: string;
    account_type: number;
    status: number;
    last_login: string;
    updatedAt: string;
    createdAt: string;
}

export interface updateFieldsGoogle{
    role_id: number, 
    password: string, 
    address: string, 
    phone: string;
}

export interface updateFieldsGoogleRes{
    message: string;
    user: usersWithImage[]
}

