'use client'
import { User } from "@prisma/client";
import React from "react";

interface ModalProviderProps {
    children: React.ReactNode
}

export type ModalData = {
    user?: User
}

