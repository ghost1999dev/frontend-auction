export interface userResponse{
    message: string;
    usersWithImage: usersWithImage[]
}

export interface usersWithImage{
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    image: string;
    status: boolean;
    created_at: string;
    updated_at: string;
}

export interface activateReq{
    email: string;
}

export interface activateRes{
    message: string;
    status: 200;
}

ex


