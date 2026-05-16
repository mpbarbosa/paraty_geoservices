// ── Coordinator ───────────────────────────────────────────────────────────────
/**
 * Coordinates address-component change detection and observer notification.
 *
 * Depends only on locally-defined application-layer ports; concrete
 * collaborators (logger, observer container, extractor) are injected at
 * construction/wiring time so the application layer stays free of CDN
 * or infrastructure imports.
 *
 * @since 0.9.0-alpha
 */
class ChangeDetectionCoordinator {
    constructor(params) {
        this.addressState = params.addressState;
        this.observerSubject = params.observerSubject;
        this.logger = params.logger;
        this.currentPosition = null;
        this.extractor = null;
    }
    /** Injects the address-component extractor. Call once during wiring. */
    setAddressComponentExtractor(extractor) {
        this.extractor = extractor;
    }
    /** Updates the cached position forwarded to function observers. */
    setCurrentPosition(position) {
        this.currentPosition = position;
    }
    // ── Lifecycle ─────────────────────────────────────────────────────────────
    setupChangeDetection() {
        this.setupStreetChangeDetection();
        this.setupNeighborhoodChangeDetection();
        this.setupCityChangeDetection();
    }
    removeAllChangeDetection() {
        this.removeStreetChangeDetection();
        this.removeNeighborhoodChangeDetection();
        this.removeCityChangeDetection();
    }
    // ── Per-field setup / removal ─────────────────────────────────────────────
    setupStreetChangeDetection() {
        if (!this.extractor) {
            this.logger.warn('(ChangeDetectionCoordinator) Address component extractor not available');
            return;
        }
        this.extractor.setStreetChangeCallback((event) => this.handleStreetChange(event));
    }
    removeStreetChangeDetection() {
        this.extractor?.setStreetChangeCallback(null);
    }
    setupNeighborhoodChangeDetection() {
        if (!this.extractor) {
            this.logger.warn('(ChangeDetectionCoordinator) Address component extractor not available');
            return;
        }
        this.extractor.setNeighborhoodChangeCallback((event) => this.handleNeighborhoodChange(event));
    }
    removeNeighborhoodChangeDetection() {
        this.extractor?.setNeighborhoodChangeCallback(null);
    }
    setupCityChangeDetection() {
        if (!this.extractor) {
            this.logger.warn('(ChangeDetectionCoordinator) Address component extractor not available');
            return;
        }
        this.extractor.setCityChangeCallback((event) => this.handleCityChange(event));
    }
    removeCityChangeDetection() {
        this.extractor?.setCityChangeCallback(null);
    }
    // ── Change handlers (called by extractor callbacks) ───────────────────────
    handleStreetChange(event) {
        try {
            this.notifyStreetChangeObservers(event);
        }
        catch (err) {
            this.logger.error('(ChangeDetectionCoordinator) Error handling street change', err);
        }
    }
    handleNeighborhoodChange(event) {
        try {
            this.notifyNeighborhoodChangeObservers(event);
        }
        catch (err) {
            this.logger.error('(ChangeDetectionCoordinator) Error handling neighborhood change', err);
        }
    }
    handleCityChange(event) {
        try {
            this.notifyCityChangeObservers(event);
        }
        catch (err) {
            this.logger.error('(ChangeDetectionCoordinator) Error handling city change', err);
        }
    }
    // ── Public notification API ───────────────────────────────────────────────
    notifyStreetChangeObservers(event) {
        this._notifyObservers(event, 'StreetChanged', event.to);
    }
    notifyNeighborhoodChangeObservers(event) {
        this.logger.info('(ChangeDetectionCoordinator) Notifying observers of neighborhood change.');
        this._notifyObservers(event, 'NeighborhoodChanged', event.to);
    }
    notifyCityChangeObservers(event) {
        this.logger.info('(ChangeDetectionCoordinator) Notifying observers of city change.');
        this._notifyObservers(event, 'CityChanged', event.to);
    }
    // ── Private dispatch ──────────────────────────────────────────────────────
    _notifyObservers(event, changeType, changeData) {
        for (const observer of this.observerSubject.observers ?? []) {
            if (typeof observer.update === 'function') {
                observer.update(changeData, changeType, null, event);
            }
        }
        this._notifyFunctionObservers(event, changeType);
    }
    _notifyFunctionObservers(event, changeType) {
        for (const fn of this.observerSubject.functionObservers) {
            try {
                fn(this.currentPosition, this.addressState.currentAddress, event);
            }
            catch (err) {
                this.logger.error(`(ChangeDetectionCoordinator) Error notifying function observer about ${changeType}`, err);
            }
        }
    }
}
export default ChangeDetectionCoordinator;
export { ChangeDetectionCoordinator };
