package com.railway.concessionsystem.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class SessionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        String path = request.getRequestURI();

        // Allow CORS preflight
        if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
            return true;
        }

        // Allow login endpoints
        if (path.startsWith("/api/auth")) {
            return true;
        }

        HttpSession session = request.getSession(false);

        if (session == null) {
            response.setStatus(401);
            return false;
        }

        // If user logged in → allow all secured APIs
        Object role = session.getAttribute("userRole");

        if (role != null) {
            return true;
        }

        response.setStatus(403);
        return false;
    }
}
