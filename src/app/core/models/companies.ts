export interface getCompaniesResponse{
    message: string,
    companies: companies[]
}

export interface companies{
    id: number,
    user_id: number,
    nrc_number: string,
    business_type: string,
    web_site: string,
    nit_number: string,
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