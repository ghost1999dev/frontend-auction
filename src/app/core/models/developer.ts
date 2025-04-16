export interface addDeveloperResponse{
    message: string,
    developer: addDeveloper[];
}

export interface addDeveloper{
    bio: string, 
    user_id: number, 
    linkedin: string, 
    occupation: string, 
    portfolio: string
}

export interface addDeveloperResError{
    message: string,
    error: string
}

export interface getDeveloperResponse{
    message: string,
    developers: getDeveloper[]
}

export interface getDeveloper{
    id: number,
    bio: string,
    user_id: number,
    linkedin: string,
    occupation: string,
    portfolio: string,
    createdAt: string,
    updatedAt: string,
    user: getUserRelations[]
}

export interface getUserRelations{
    role_id: number,
    name: string,
    email: string,
    address: string,
    phone: string,
    image: string,
    role: getUserRoleRelations[]
}

export interface getUserRoleRelations{
    role_name: string
}

