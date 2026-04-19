/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChangePassword } from '../models/ChangePassword';
import type { ChangePasswordRequest } from '../models/ChangePasswordRequest';
import type { InviteCode } from '../models/InviteCode';
import type { InviteCodeRequest } from '../models/InviteCodeRequest';
import type { Me } from '../models/Me';
import type { PasswordValiRequest } from '../models/PasswordValiRequest';
import type { PatchedChangePasswordRequest } from '../models/PatchedChangePasswordRequest';
import type { PatchedInviteCodeRequest } from '../models/PatchedInviteCodeRequest';
import type { PatchedProfileUpdateRequest } from '../models/PatchedProfileUpdateRequest';
import type { ProfileUpdate } from '../models/ProfileUpdate';
import type { ProfileUpdateRequest } from '../models/ProfileUpdateRequest';
import type { Register } from '../models/Register';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { TokenObtainPair } from '../models/TokenObtainPair';
import type { TokenObtainPairRequest } from '../models/TokenObtainPairRequest';
import type { TokenRefresh } from '../models/TokenRefresh';
import type { TokenRefreshRequest } from '../models/TokenRefreshRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * @param requestBody
     * @returns ChangePassword
     * @throws ApiError
     */
    public static authChangePasswordUpdate(
        requestBody: ChangePasswordRequest,
    ): CancelablePromise<ChangePassword> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/auth/change-password/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ChangePassword
     * @throws ApiError
     */
    public static authChangePasswordPartialUpdate(
        requestBody?: PatchedChangePasswordRequest,
    ): CancelablePromise<ChangePassword> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/auth/change-password/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns InviteCode
     * @throws ApiError
     */
    public static authInviteCodesList(): CancelablePromise<Array<InviteCode>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/auth/invite-codes/',
        });
    }
    /**
     * @param requestBody
     * @returns InviteCode
     * @throws ApiError
     */
    public static authInviteCodesCreate(
        requestBody: InviteCodeRequest,
    ): CancelablePromise<InviteCode> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/invite-codes/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this invite code.
     * @returns InviteCode
     * @throws ApiError
     */
    public static authInviteCodesRetrieve(
        id: number,
    ): CancelablePromise<InviteCode> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/auth/invite-codes/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this invite code.
     * @param requestBody
     * @returns InviteCode
     * @throws ApiError
     */
    public static authInviteCodesUpdate(
        id: number,
        requestBody: InviteCodeRequest,
    ): CancelablePromise<InviteCode> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/auth/invite-codes/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this invite code.
     * @param requestBody
     * @returns InviteCode
     * @throws ApiError
     */
    public static authInviteCodesPartialUpdate(
        id: number,
        requestBody?: PatchedInviteCodeRequest,
    ): CancelablePromise<InviteCode> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/auth/invite-codes/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this invite code.
     * @returns void
     * @throws ApiError
     */
    public static authInviteCodesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/auth/invite-codes/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Takes a set of user credentials and returns an access and refresh JSON web
     * token pair to prove the authentication of those credentials.
     * @param requestBody
     * @returns TokenObtainPair
     * @throws ApiError
     */
    public static authLoginCreate(
        requestBody: TokenObtainPairRequest,
    ): CancelablePromise<TokenObtainPair> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/login/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns Me
     * @throws ApiError
     */
    public static authMeRetrieve(): CancelablePromise<Me> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/auth/me/',
        });
    }
    /**
     * @returns ProfileUpdate
     * @throws ApiError
     */
    public static authProfileRetrieve(): CancelablePromise<ProfileUpdate> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/auth/profile/',
        });
    }
    /**
     * @param requestBody
     * @returns ProfileUpdate
     * @throws ApiError
     */
    public static authProfileUpdate(
        requestBody?: ProfileUpdateRequest,
    ): CancelablePromise<ProfileUpdate> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/auth/profile/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ProfileUpdate
     * @throws ApiError
     */
    public static authProfilePartialUpdate(
        requestBody?: PatchedProfileUpdateRequest,
    ): CancelablePromise<ProfileUpdate> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/auth/profile/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Takes a refresh type JSON web token and returns an access type JSON web
     * token if the refresh token is valid.
     * @param requestBody
     * @returns TokenRefresh
     * @throws ApiError
     */
    public static authRefreshCreate(
        requestBody: TokenRefreshRequest,
    ): CancelablePromise<TokenRefresh> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/refresh/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns Register
     * @throws ApiError
     */
    public static authRegisterCreate(
        requestBody: RegisterRequest,
    ): CancelablePromise<Register> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/register/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any No response body
     * @throws ApiError
     */
    public static authValidatePasswordCreate(
        requestBody: PasswordValiRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/validate-password/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
