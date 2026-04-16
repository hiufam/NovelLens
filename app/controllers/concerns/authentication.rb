# https://api.rubyonrails.org/classes/ActiveSupport/Concern.html
module Authentication extend ActiveSupport::Concern
  # called when included in other Module (Declare helper methods and callback before actions when include in ActionController)
  # https://web.stanford.edu/~ouster/cgi-bin/cs142-winter15/classEval.php
  # https://www.rubyguides.com/2016/02/ruby-procs-and-lambdas/
  included do
    before_action :require_authentication
    helper_method :authenticated?
  end

  # Defined methods. When other modules include this module, we can call Module.defined_method
  class_methods do
    def allow_unauthenticated_access(**options)
      before_action -> { resume_session }
      skip_before_action :require_authentication, **options
    end

    def unauthenticated_access_only(**options)
      allow_unauthenticated_access(**options)
      before_action -> { redirect_to root_path if authenticated? }, **options
    end
  end

  # Session: https://api.rubyonrails.org/classes/ActionDispatch/Integration/Session.html
  private
    def authenticated?
      resume_session
    end

    def require_authentication
      resume_session || request_authentication
    end

    # Check for expired sessions and remove them. If current session is removed return nil
    def resume_session
      Current.session ||= find_session_by_cookie
    end

    def find_session_by_cookie
      Session.find_by(id: cookies.signed[:session_id]) if cookies.signed[:session_id]
    end

    def request_authentication
      session[:return_to_after_authenticating] = request.url
      redirect_to new_session_path
    end

    def after_authentication_url
      session.delete(:return_to_after_authenticating) || root_url
    end

    # Assign created session to Current singleton and add session_id to cookie
    def start_new_session_for(user)
      user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip).tap do |session|
        Current.session = session
        cookies.signed.permanent[:session_id] = { value: session.id, httponly: true, same_site: :lax }
      end
    end

    def terminate_session
      Current.session.destroy
      cookies.delete(:session_id)
    end

    # This is perhaps unnessary cause new session is created every login
    # https://guides.rubyonrails.org/security.html#session-fixation-countermeasures
    # https://stackoverflow.com/questions/4812813/rails-login-reset-session
    def mitigate_session_fixation
      old_values = session.to_hash
      reset_session
      session.update old_values.except("session_id")
    end
end
