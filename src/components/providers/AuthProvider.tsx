"use client";

import {useEffect} from "react";
import {useAuth} from "@clerk/nextjs";
import {useWorkflowStore} from "@/store/workflowStore";

export function AuthProvider({children}: {children: React.ReactNode}) {
	const {userId, isLoaded} = useAuth();
	const setUserId = useWorkflowStore((state) => state.setUserId);

	useEffect(() => {
		if (isLoaded) {
			setUserId(userId);
		}
	}, [userId, isLoaded, setUserId]);

	return <>{children} </>;
}
