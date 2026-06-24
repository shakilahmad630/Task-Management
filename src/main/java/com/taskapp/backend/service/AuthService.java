package com.taskapp.backend.service;



import com.taskapp.backend.Utility.Constants;
import com.taskapp.backend.dto.AuthResponseDTO;
import com.taskapp.backend.dto.LoginRequestDTO;
import com.taskapp.backend.dto.SignupRequestDTO;
import com.taskapp.backend.entity.User;
import com.taskapp.backend.repository.UserRepository;
import com.taskapp.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtService jwtService;


    public User signup(SignupRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException(Constants.EMAIL_EXISTS);
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException(Constants.EMAIL_REQUIRED);
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));

        return userRepository.save(user);

    }


    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("username or password is wrong"));
        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("username or password is wrong");
        }

        String token = jwtService.generateToken(user);
        return AuthResponseDTO.builder()
                .id(user.getId())
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();

    }


}