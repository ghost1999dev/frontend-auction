export interface userResponse{
    message: string;
    usersWithImage: usersWithImage[]
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

export interface addUserResponse{
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

